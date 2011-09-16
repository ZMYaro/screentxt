import cgi
import os

from google.appengine.api import channel
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

from random import randint

class Settings(db.Model):
	user = db.UserProperty()    # the user associated with the entry
	msg = db.StringProperty()   # the message the user is displaying
	font = db.StringProperty()  # the font in which to display the message
	disps = db.StringProperty() # the list of client IDs for the user's displays

class OtherPg(webapp.RequestHandler):
	def get(self):
		self.redirect('/disp')

class SettingsPg(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			self.response.headers['Content-Type'] = 'text/html;charset=utf-8'
			self.response.headers['X-UA-Compatible'] = 'chrome=1'
			
			if Settings.gql('WHERE user = :1', user).count() > 0:
				settings = Settings.gql('WHERE user = :1', user).get()
				if not settings.msg:
					settings.msg = ''
				if not settings.font:
					settings.font = 'sans-serif'
				if not settings.disps:
					settings.disps = ''
			else:
				settings = Settings()
				settings.user = user
				settings.msg = ''
				settings.font = 'sans-serif'
				settings.disps = ''
				settings.put()
			
			path = os.path.join(os.path.dirname(__file__), 'settings.html')
			self.response.out.write(template.render(path, {'useremail':user.email(), 'msg':settings.msg, 'font':settings.font, 'disps':settings.disps}))
		else:
			self.redirect(users.create_login_url(self.request.uri))
		

class DispPg(webapp.RequestHandler):
	def get(self):
		user = users.get_current_user()
		if user:
			self.response.headers['Content-Type'] = 'text/html;charset=utf-8'
			self.response.headers['X-UA-Compatible'] = 'chrome=1'
			
			if Settings.gql('WHERE user = :1', user).count() > 0:
				settings = Settings.gql('WHERE user = :1', user).get()
				if not settings.msg:
					settings.msg = ''
				if not settings.font:
					settings.font = 'sans-serif'
				if not settings.disps:
					settings.disps = ''
			else:
				settings = Settings()
				settings.user = user
				settings.msg = ''
				settings.font = 'sans-serif'
				settings.disps = ''
			
			userDisps = settings.disps.split(',')
			newDisp = randint(0,999999)
			if len(userDisps) > 1:
				while newDisp in userDisps:
					newDisp = randint(0,999999)
			settings.disps += ',' + `newDisp`
			settings.put()
			
			token = channel.create_channel(user.user_id() + `newDisp`)
			
			path = os.path.join(os.path.dirname(__file__), 'disp.html')
			self.response.out.write(template.render(path, {'useremail':user.email(), 'token':token, 'msg':settings.msg, 'font':settings.font}))
		else:
			self.redirect(users.create_login_url(self.request.uri))

class SetSetting(webapp.RequestHandler):
	def get(self, setting, val):
		self.redirect('/settings')
	def post(self, setting, val):
		user = users.get_current_user()
		if user:
			if (Settings.gql('WHERE user = :1', user).count() > 0):
				settings = Settings.gql('WHERE user = :1', user).get()
				if not settings.msg:
					settings.msg = ''
				if not settings.font:
					settings.font = 'sans-serif'
				if not settings.disps:
					settings.disps = ''
			else:
				settings = Settings()
				settings.user = user
				settings.msg = ''
				settings.font = 'sans-serif'
				settings.color = 'black'
				settings.disps = ''
				
			setattr(settings, setting, val)#urllib.unquote(val))
			settings.put()
			
			userDisps = settings.disps.split(',') # -------------------------------- get the list of displays
			for disp in userDisps: # ----------------------------------------------- and for each one...
				if disp != '': # --------------------------------------------------- ...assuming it exists
					channel.send_message(user.user_id() + disp, setting[:3] + val) # send the new value prefixed with the first three letters of the setting
			
			self.response.out.write('')
		else:
			self.error(403)

class GetSetting(webapp.RequestHandler):
	def get(self, setting):
		user = users.get_current_user()
		if user:
			if Settings.gql('WHERE user = :1', user).count() > 0:
				settings = Settings.gql('WHERE user = :1', user).get()
				if not settings.msg:
					settings.msg = ''
				if not settings.font:
					settings.font = 'sans-serif'
				if not settings.disps:
					settings.disps = ''
			else:
				settings = Settings()
				settings.user = user
				settings.msg = ''
				settings.font = 'sans-serif'
				settings.disps = ''
			settings.put()
			
			defaults = {'msg':'', 'font':'sans-serif', 'color':'black', 'disps':''}
			
			self.response.out.write(getattr(settings, setting, defaults[setting]))
		else:
			self.error(403)

class RobotsTxt(webapp.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/plain;charset=utf-8'
		self.response.out.write('User-agent: *\nDisallow: /')

site = webapp.WSGIApplication(
                              [('/robots.txt', RobotsTxt),
                               ('/settings', SettingsPg),
                               ('/disp', DispPg),
                               ('/set/(.*)/(.*)', SetSetting),
                               ('/get/(.*)', GetSetting),
                               ('/(.*)', OtherPg)],
                              debug=True)

def main():
	run_wsgi_app(site)

if __name__ == '__main__':
	main()
